import json
from time import sleep
from dotenv import load_dotenv
import os
import ccxt
from Pairs import getTradingPairs
from Exchanges import initiateExchagnes
from datetime import date, datetime

OPPORTUNITY_THRESHOLD = 0.2
TRADE_AMOUNT = 100
MAX_DIFF = 1.5

#Calculates buy and sell price available for the order size on an exchange
def calculatePrice(exchange,symbol):
    MIN_DEPTH = TRADE_AMOUNT
    index=ask=depth_bid=depth_ask = 0
    bid = None
    try:
        orderbook = exchange.fetchOrderBook(symbol)
    except:
        return None
    
    if(len(orderbook['bids'])>5 and len(orderbook['asks'])>5):
        while((depth_bid*orderbook['bids'][index][0] < MIN_DEPTH or depth_ask*orderbook['asks'][index][0] <MIN_DEPTH) and index < len(orderbook['bids']) and index < len(orderbook['asks'])):
            if bid == None:bid = orderbook['bids'][index][0] 
            else: bid = min(orderbook['bids'][index][0],bid)
            ask = max(orderbook['asks'][index][0],ask)
            depth_bid += orderbook['bids'][index][1]
            depth_ask += orderbook['asks'][index][1]
            index +=1
    return {'ask':ask,'bid':bid}

#Executes two necessary arbitrage trades
def executeOrder(exchange1,exchange2,buyPrice,sellPrice,sellAmount,symbol):
    currencies = symbol.split('/')
    exchange1.create_limit_buy_order(symbol,TRADE_AMOUNT,buyPrice)
    exchange2.create_limit_sell_order(symbol,sellAmount,sellPrice)
    
#Starts arbitrage checking after initializing exchanges
def main():

    tradingPairs = getTradingPairs()
    exchanges = initiateExchagnes()
    bitstamp,lykke,binance,huobi,kucoin = exchanges
    startCLI()
    exchangePairs = [[exchange1,exchange2] for exchange1 in exchanges for exchange2 in exchanges if exchange1 != exchange2]
    checkMarkets(tradingPairs,exchangePairs)

#Checks for available arbitrage opportunities between given trading pair and exchange pair
def checkMarkets(tradingPairs,exchangePairs):
    while True:
        sleep(5)
        for tradingPair in tradingPairs:
            for exchangePair in exchangePairs:
                try:
                    ex1,ex2 = exchangePair
                    price1 = calculatePrice(ex1['ex'],tradingPair)
                    price2 = calculatePrice(ex2['ex'],tradingPair)
                    if price1 == None or price2 == None: continue
                    bid1,bid2 = price1['bid'],price2['bid']
                    ask1,ask2 = price1['ask'],price2['ask']
                    if bid1 == 0 or ask1 == 0 or bid2 == 0 or ask2 == 0: continue
                    if bid2 > MAX_DIFF*ask1 or ask1 > MAX_DIFF*bid2: continue 
                    mixedOut = TRADE_AMOUNT*ask1/bid2-TRADE_AMOUNT
                    fee1=TRADE_AMOUNT*ex1['fee']
                    fee2=TRADE_AMOUNT*ex2['fee']
                    outcome = ((mixedOut-fee1-fee2)/TRADE_AMOUNT)*100
                    if outcome > OPPORTUNITY_THRESHOLD:
                        executeOrder(ex1['ex'],ex2['ex'],ask1,bid2,)
                    logAndPrint(ex1,ask1,ex2,bid2,fee1,fee2,outcome,tradingPair)
                
                except:
                    print('tradingPair not available on exchange')


#This Function is soley for CLI output
def startCLI():
    print('                             ARBITRAGE OPPORTUNITIES                             ')
    print('---------------------------------------------------------------------------------')
    print('Profit           Currency Pair           Buy at     for         Sell at    for')

#This Function is soley for logging results and CLI output
def logAndPrint(ex1,ask1,ex2,bid2,fee1,fee2,outcome,tradingPair):
    swap = {}
    swap['Buy'] = {
        'Ex':ex1['ex'].id,
        'AmountIn':TRADE_AMOUNT,
        'AmountOut':TRADE_AMOUNT*ask1
    }
    swap['Sell'] = {
        'Ex':ex2['ex'].id,
        'AmountIn':TRADE_AMOUNT*ask1,
        'AmountOut': TRADE_AMOUNT*ask1/bid2
    }
    swap['fee']=fee1+fee2
    swap['NetDif']=outcome
    swap['TradingPair'] = tradingPair
    dt = datetime.now()
    swap['Timestamp'] = datetime.timestamp(dt)
    swap['Arbitrage'] = round(outcome,3)
    # if outcome > 0:
    print('..................................................................................') 
    print(f'{round(outcome,3)}%           {tradingPair}               {ex1["ex"].id}    {ask1}    {ex2["ex"].id}    {bid2}')

    with open('output/output.json','r') as f:
                        json_object = json.load(f)
                        with open('output/output.json','w') as w:
                            json_object["Swaps"].append(swap)
                            new_json_object = json.dumps(json_object)
                            w.write(new_json_object)


if __name__ == "__main__":
    main()