baseCurrencies = ['USDT']
currencies = ['XRP','ADA','SOL','XLM', 'BTC', 'ETH','LTC']
tradingParis = [currency + '/' + baseCurrency for currency in currencies for baseCurrency in baseCurrencies if currency != baseCurrency]

def getTradingPairs():
    return tradingParis