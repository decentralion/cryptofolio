// @flow

import moment from "moment";
import Big from "big.js";

import {parseNumber, parseDate} from "./parse";

describe("parseNumber", () => {
  it("handles simple numeric cases", () => {
    expect(parseNumber(0.1)).toEqual(Big("0.1"));
    expect(parseNumber(5)).toEqual(Big("5"));
  });

  it("Throws error on empty string", () => {
    expect(() => parseNumber("")).toThrow("empty string");
  });
  it("handles simple string cases", () => {
    expect(parseNumber("0.1")).toEqual(Big("0.1"));
    expect(parseNumber("5")).toEqual(Big("5"));
  });
  it("handles strings with dollar signs", () => {
    expect(parseNumber("$50")).toEqual(Big("50"));
  });
  it("handles strings with commas", () => {
    expect(parseNumber("50,000")).toEqual(Big("50000"));
    expect(parseNumber("50,000,000.00")).toEqual(Big("50000000"));
  });
  it("errors on bad inputs", () => {
    expect(() => parseNumber("500btc")).toThrow();
    expect(() => parseNumber("50$0")).toThrow();
    expect(() => parseNumber("")).toThrow();
    //$ExpectError
    expect(() => parseNumber(true)).toThrow();
    //$ExpectError
    expect(() => parseNumber(null)).toThrow();
  });
});

describe("parseDate", () => {
  function momentOnDate(year, month, day) {
    return moment().set({
      year,
      month: month - 1,
      date: day,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  }
  it("Throws error on empty string", () => {
    expect(() => parseDate("")).toThrow("empty string");
  });
  it("parses slash dates", () => {
    expect(parseDate("04/03/2015").isSame(momentOnDate(2015, 4, 3))).toBe(true);
  });
  it("parses dash dates", () => {
    expect(parseDate("04-03-2015").isSame(momentOnDate(2015, 4, 3))).toBe(true);
  });
  it("errors on bad dates", () => {
    expect(() => parseDate("")).toThrow();
  });
});
