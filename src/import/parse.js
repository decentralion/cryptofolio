// @flow

import moment from "moment";
import Big from "big.js";

export function parseNumber(x: string | number) {
  if (typeof x === "number") {
    return Big(x);
  }
  if (typeof x !== "string") {
    throw new Error(`parseNumber: unexpected type ${x}`);
  }
  if (x === "") {
    throw new Error("Tried to parse empty string");
  }
  if (x[0] === "$") {
    x = x.substr(1);
  }
  const stripped = x.replace(/,/g, "");
  const val = Big(stripped);
  return val;
}

export function parseDate(x: string) {
  if (x === "") {
    throw new Error("Tried to parse empty string");
  }
  x = x.replace(/\//g, "-");
  if (!x.match(/\d+-\d+-\d+/)) {
    throw new Error(`${x} doesn't look like a date`);
  }
  const date = moment(x, "MM-DD-YYYY");

  return date;
}
