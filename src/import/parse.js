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
  const xc = x.replace(/\//g, "-");
  if (!xc.match(/\d+-\d+-\d+/)) {
    throw new Error(`${xc} doesn't look like a date`);
  }
  const date = moment(xc, "MM-DD-YYYY");

  if (!date.isValid()) {
    throw new Error(`Invalid moment from ${x} (cleaned to ${xc})`);
  }

  return date;
}
