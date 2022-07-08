from dotenv import load_dotenv
import os
import ccxt


def initiateExchagnes():
    load_dotenv()

    binance_access_key = os.environ.get('BINANCE_KEY_HOME')
    binance_secret_key = os.environ.get('BINANCE_SECRET_HOME')
    binance = ccxt.binance({
        'apiKey' : binance_access_key,
        'secret' : binance_secret_key,
        'enableRateLimit':True,
        'options':{'adjustForTimeDifference': True} 
    })
    binance.precisionMode = ccxt.DECIMAL_PLACES
    binance.load_markets()

    huobi_access_key = os.environ.get('HUOBI_KEY_HOME')
    huobi_secret_key = os.environ.get('HUOBI_SECRET_HOME')
    huobi = ccxt.huobi({
        'apiKey' : huobi_access_key,
        'secret' : huobi_secret_key,
        'enableRateLimit':True,
    })
    huobi.precisionMode = ccxt.DECIMAL_PLACES
    huobi.load_markets()

    kucoin_access_key = os.environ.get('KUCOIN_KEY_HOME')
    kucoin_secret_key = os.environ.get('KUCOIN_SECRET_HOME')
    kucoin_password = os.environ.get('KUCOIN_PASSWORD')
    kucoin = ccxt.kucoin({
        'apiKey':kucoin_access_key,
        'secret':kucoin_secret_key,
        'password':kucoin_password,
        'enabledRateLimit':True,
    })
    kucoin.precisionMode = ccxt.DECIMAL_PLACES
    kucoin.load_markets()

    bitstamp_access_key = os.environ.get('BITSTAMP_KEY_HOME')
    bitstamp_secret_key = os.environ.get('BITSTAMP_SECRET_HOME')
    bitstamp = ccxt.bitstamp({
        'apiKey':bitstamp_access_key,
        'secret':bitstamp_secret_key,
        'enableRateLimit':True
    })
    bitstamp.load_markets()

    lykke_access_key = os.environ.get('LYKKE_KEY_HOME')
    lykke = ccxt.lykke({
        'apiKey':lykke_access_key
    })
    lykke.load_markets()

    return {'ex':bitstamp,'fee':0.005},{'ex':lykke,'fee':0.0},{'ex':binance,'fee':0.001},{'ex':huobi,'fee':0.002},{'ex':kucoin,'fee':0.001}