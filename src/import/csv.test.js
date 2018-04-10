// @flow

import {parseTrades, parseTransactions} from "./csv";

describe("parseTrades", () => {
  const tradesTestCase = `\
Date,Src,Src Amount,Src Price,Dst,Dst Amount,Dst Price
9/29/2010,USD,"4,000.000",$1.00,BTC,1.000,"$4,000.00"
10/1/2010,USD,"2,000.000",$1.00,ETH,6.000,$300.00
10/1/2010,USD,600.000,$1.00,ETH,2.000,$300.00
10/1/2010,USD,"1,000.000",$1.00,LTC,20.000,$50.00`;
  it("snapshots as expected", () => {
    expect(parseTrades(tradesTestCase)).toMatchSnapshot();
  });
});

describe("parseTransactions", () => {
  const transactionsTestCase = `\
Date,Currency,Amount,Type,Price On Date,Notes
1/1/2010,BTC,2.0101,FUND,$250.00,Start
8/1/2017,BCH,2.0101,FORK,$500.00,BCH Fork`;
  it("snapshots as expected", () => {
    expect(parseTransactions(transactionsTestCase)).toMatchSnapshot();
  });
});
