// @flow
// Run this on a transactions file to calculate all the capital gains from those transactions

import fs from "fs";
import stringify from "json-stable-stringify";
import path from "path";
import {txSort, fromJSON} from "../../core/transaction";
import {TaxAccumulator} from "../taxAccumulator";

function parseArgs() {
  const argv = process.argv.slice(2);
  const fail = () => {
    const invocation = process.argv.slice(0, 2).join(" ");
    throw new Error(`Usage: ${invocation} dataFile`);
  };
  if (argv.length < 1) {
    fail();
  }
  const [dataFile, ...rest] = argv;
  const result = {dataFile};
  if (rest.length !== 0) {
    fail();
  }
  return result;
}

function main() {
  const args = parseArgs();
  const accumulator = new TaxAccumulator();
  let transactions = JSON.parse(fs.readFileSync(args.dataFile, {encoding: 'utf-8'})).map(fromJSON);
  transactions = txSort(transactions);
  transactions.forEach((tx) => accumulator.process(tx));
  console.log(stringify( accumulator.gains , {space: 2}));
}

main();
