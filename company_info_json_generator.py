import pandas as pd
from urllib.request import urlopen
import json
from yahoo_fin import stock_info as si
import time

df1 = pd.DataFrame( si.tickers_sp500() )
df2 = pd.DataFrame( si.tickers_nasdaq() )
df3 = pd.DataFrame( si.tickers_dow() )
sym1 = set( symbol for symbol in df1[0].values.tolist() )
sym2 = set( symbol for symbol in df2[0].values.tolist() )
sym3 = set( symbol for symbol in df3[0].values.tolist() )
symbols = set.union( sym1, sym2, sym3 )
symbols = set.union( sym1 )

final_json = {}
for ticker in symbols:
    print(ticker)
    price = si.get_quote_table(ticker)["Quote Price"]
    mkt_cap = si.get_quote_table(ticker)["Market Cap"]
    if ("T" in mkt_cap):
        mkt_cap = float(mkt_cap.replace("T", "")) * 1000000000000
    elif ("B" in mkt_cap):
        mkt_cap = float(mkt_cap.replace("B", "")) * 1000000000
    final_json[ticker] = {
        "price": price,
        "mkt_cap": mkt_cap
    }
with open('company_info.json', 'w') as outfile:
    json.dump(final_json, outfile)
