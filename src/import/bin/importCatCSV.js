/* importCatCSV.js
 *
 * This file imports CAT data in CSV format from "cat_import/transactions.csv"
 * and "cat_import/trades.csv", and writes the parsed data to
 * "transactions/cat.json".  To run it, specify the top-level data directory.
 * It's advisable for that directory to be a git repository.
 */

import parse from "csv-parse/lib/sync";
import fs from "fs";
import {parseTransactions, parseTrades} from "../csv";
import path from "path";
import stringify from "json-stable-stringify";
import {txSort} from "../../core/transaction";

function parseArgs() {
  const argv = process.argv.slice(2);
  const fail = () => {
    const invocation = process.argv.slice(0, 2).join(" ");
    throw new Error(`Usage: ${invocation} data_directory`);
  };
  if (argv.length < 1) {
    fail();
  }
  const [dataDirectory, ...rest] = argv;
  const result = {dataDirectory};
  if (rest.length !== 0) {
    fail();
  }
  return result;
}

function main() {
  const args = parseArgs();
  const dataDirectory = args.dataDirectory;
  const txFile = path.join(dataDirectory, "transactions.csv");
  const trFile = path.join(dataDirectory, "trades.csv");
  const txContents = fs.readFileSync(txFile);
  const trContents = fs.readFileSync(trFile);
  const transactions = parseTransactions(txContents);
  const trades = parseTrades(trContents);
  console.log(
    `Parsed ${transactions.length} transactions and ${trades.length} trades`
  );

  const allTxSorted = txSort(transactions.concat(trades));
  const txOutputFile = path.join(dataDirectory, "cat.json");
  const output = stringify(allTxSorted, {space: 2});
  fs.writeFileSync(txOutputFile, output);
  console.log(`Wrote ${allTxSorted.length} transactions to ${txOutputFile}`);
}

main();
